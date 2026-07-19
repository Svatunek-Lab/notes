---
title: "Running UMA with ORCA on the NVIDIA DGX Spark"
date: 2026-07-19
author: Dennis Svatunek
abstract: "Notes on setting up orca-mlips with the UMA foundation model on the NVIDIA DGX Spark, including ARM-specific considerations and a persistent Docker-based workflow for efficient ORCA external calculations."
head: []
tags: dgx-spark, nvidia, orca, orca-mlips, uma, arm64, docker, computational-chemistry
image: /images/dgx_spark.jpg
---

The **NVIDIA DGX Spark** is an interesting little machine for local machine-learning potentials: it has a decent NVIDIA GPU and, more importantly for models like **UMA**, a lot of unified memory. That makes it tempting to try as a compact box for running **orca-mlips** calculations without sending every job to a larger workstation or cluster.

The problem is the software stack. A normal `pip install torch` currently installs **PyTorch 2.8.0**, but on this ARM64 system that build is CPU-only. CUDA support is available through NVIDIA's PyTorch containers. The first usable-looking image, `nvcr.io/nvidia/pytorch:25.06-py3`, provides a development build, **2.8.0a0**, which does not satisfy **orca-mlips'** requirement for `torch >= 2.8.0`.

Relaxing the orca-mlips version check is not enough. **FairChem** wants a PyTorch version around 2.8.0 and also requires **NumPy >= 2.1**, while the available NVIDIA PyTorch 2.8.0a0 build is compiled against the NumPy 1.x ABI. With NumPy 2.x installed, imports and compiled extensions start breaking. In other words: the individual pieces almost fit, but the PyTorch build, NumPy ABI, FairChem, and orca-mlips requirements do not quite line up.

The solution was to move to `nvcr.io/nvidia/pytorch:25.10-py3`. That container ships **PyTorch 2.9.0a0** with a compatible NumPy setup, so orca-mlips is satisfied and the NumPy ABI problem goes away. The remaining issue is the **fairchem_core-2.21.0** wheel, which pins PyTorch to `~2.8.0`; I downloaded and modified the wheel metadata to change that requirement to `torch >= 2.8.0`.

The Dockerfile I used is:

```dockerfile
FROM nvcr.io/nvidia/pytorch:25.10-py3

LABEL maintainer="Dennis Svatunek"

WORKDIR /workspace

# Keep pip tooling up to date
RUN python -m pip install --upgrade pip wheel

# Copy patched FairChem wheel
COPY wheels/fairchem_core-2.21.0-py3-none-any.whl /tmp/

# Install patched FairChem
RUN pip install /tmp/fairchem_core-2.21.0-py3-none-any.whl

# Install orca-mlips
RUN pip install "orca-mlips[uma]"

# ORCA will be mounted here at runtime
ENV ORCA_HOME=/orca
ENV PATH="${ORCA_HOME}:${PATH}"

CMD ["/bin/bash"]
```

I then keep the container running in the background:

```bash
docker run -d \
  --name orca-mlips \
  --gpus all \
  --ipc=host \
  --ulimit memlock=-1 \
  --ulimit stack=67108864 \
  -v /opt/orca_6_1_1_linux_arm64_shared_openmpi418:/orca:ro \
  -v /tmp/orca-mlips:/jobs \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -v ~/.huggingface:/root/.huggingface \
  orca-mlips:latest \
  tail -f /dev/null
```

The ORCA installation is mounted read-only at `/orca`, which is useful for troubleshooting from inside the container. Calculation files are shared through `/tmp/orca-mlips`, and the Hugging Face cache and credentials are mounted so cached model files and authentication can be reused.

ORCA calls the following wrapper as the external program. It stages the temporary ORCA input files into the shared jobs directory, runs `uma` inside the already-running container, and copies the generated files back into ORCA's working directory:

```bash
#!/usr/bin/env bash
#
# Wrapper to execute ORCA-MLIPs UMA inside a persistent Docker container.

set -euo pipefail

CONTAINER="orca-mlips"
HOST_JOBS="/tmp/orca-mlips"
LOG="/tmp/uma_wrapper.log"

# Fixed socket for persistent UMA server
MODEL="default"
TASK="default"
DEVICE="auto"

ARGS=("$@")

for ((i=0; i<${#ARGS[@]}; i++)); do
    case "${ARGS[$i]}" in
        --model)
            MODEL="${ARGS[$((i+1))]}"
            ;;
        --task)
            TASK="${ARGS[$((i+1))]}"
            ;;
        --device)
            DEVICE="${ARGS[$((i+1))]}"
            ;;
    esac
done

SOCKET="/tmp/uma_${MODEL}*${TASK}*${DEVICE}.sock"

INPUT="$1"
shift

# Stable job directory
JOBID=$(printf "%s:%s" "$(realpath .)" "$INPUT" | sha256sum | cut -c1-16)
HOST_JOB="${HOST_JOBS}/${JOBID}"
CONT_JOB="/jobs/${JOBID}"

mkdir -p "$HOST_JOB"

cleanup() {
    rm -rf "$HOST_JOB"
}
trap cleanup EXIT

{
    echo "=================================================="
    date
    echo "PWD: $(pwd)"
    echo "JOBID: $JOBID"
    echo "INPUT: $INPUT"
    echo "SOCKET: $SOCKET"
    echo "ARGS: $*"
} >> "$LOG"

# ------------------------------------------------------------------
# Stage required files
# ------------------------------------------------------------------

cp "$INPUT" "$HOST_JOB/"

XYZ="${INPUT%.extinp.tmp}.xyz"
if [[ -f "$XYZ" ]]; then
    cp "$XYZ" "$HOST_JOB/"
fi

{
    echo
    echo "Files staged:"
    find "$HOST_JOB" -mindepth 1 -maxdepth 1 -printf "%f\n" | sort
} >> "$LOG"

# ------------------------------------------------------------------
# Run UMA
# ------------------------------------------------------------------

docker exec \
    -w "$CONT_JOB" \
    "$CONTAINER" \
    uma \
        --server-socket "$SOCKET" \
        "$INPUT" \
        "$@"

{
    echo
    echo "Files after UMA:"
    find "$HOST_JOB" -mindepth 1 -maxdepth 1 -printf "%f\n" | sort
} >> "$LOG"

# ------------------------------------------------------------------
# Copy results back
# ------------------------------------------------------------------

cp -au "$HOST_JOB"/. .

{
    echo
    echo "Files after copy-back:"
    find . -maxdepth 1 -printf "%f\n" | sort
    echo
} >> "$LOG"
```

With this setup, the fragile Python/CUDA stack stays inside the container, ORCA can still call UMA through its external optimizer interface, and the UMA server can stay alive between optimization steps instead of reloading the model every time.

An example ORCA input using the wrapper looks like this. On the DGX Spark this test ran in about 6 seconds; more systematic benchmarks will follow.

```orca
! ExtOpt Opt

%pal
  nprocs 1
end

%method
  ProgExt "/home/dsvatunek/test_uma/uma_wrapper"
  Ext_Params "--model uma-s-1p1 --task omol --device cuda"
end

* xyz 0 1
C -6.523200 2.259900 1.650300
C -6.330000 1.817600 0.198800
C -6.021600 0.288800 0.085500
C -4.688100 0.070000 -0.684200
C -3.454600 0.557600 0.110400
C -2.119700 0.302600 -0.649700
C -1.933400 1.396400 -1.721700
C -0.904700 0.254300 0.343400
C -1.061700 -0.854900 1.422400
C 0.342400 -1.377000 1.754700
C 1.269400 -0.407300 1.043800
C 0.519500 -0.011600 -0.240800
C 1.250700 1.229000 -0.813000
C 2.743100 0.934500 -1.092600
C 3.502300 0.334800 0.133800
C 2.730600 -0.844400 0.801200
C 3.411000 -1.250800 2.127100
C 4.916800 -1.136700 2.129600
C 5.634200 -0.513400 1.167500
C 4.993500 -0.078100 -0.153900
C 5.783700 1.141200 -0.710700
C 7.303100 0.907600 -0.852800
C 7.943100 0.054600 0.267900
C 7.048100 -0.080800 1.507900
O 8.267300 -1.220200 -0.228500
C 5.081500 -1.257800 -1.163100
C 0.472600 -1.159100 -1.301500
C -7.227300 -0.477500 -0.564700
C -8.492000 -0.370000 0.310300
C -6.934700 -1.971100 -0.807700
H -7.364300 1.703300 2.117500
H -6.754100 3.345000 1.681600
H -5.593400 2.075000 2.233300
H -5.522200 2.439800 -0.241900
H -7.234800 2.095300 -0.383200
H -5.877500 -0.143400 1.102400
H -4.520900 -1.010000 -0.860600
H -4.754900 0.565300 -1.675000
H -3.465800 0.015500 1.076600
H -3.531600 1.636500 0.360200
H -2.196600 -0.680600 -1.163100
H -2.884900 1.637500 -2.235700
H -1.549500 2.334600 -1.266400
H -1.243400 1.057300 -2.517400
H -0.880200 1.232200 0.878700
H -1.687300 -1.697700 1.051800
H -1.534400 -0.435700 2.338400
H 0.522500 -1.376300 2.852200
H 0.480100 -2.409400 1.364800
H 1.320600 0.492400 1.706900
H 1.180100 2.078800 -0.097900
H 0.789800 1.563400 -1.761700
H 3.210600 1.899600 -1.379700
H 2.816500 0.271400 -1.974800
H 3.536200 1.158900 0.884900
H 2.726900 -1.737500 0.150200
H 3.045600 -0.600800 2.952000
H 3.131400 -2.296000 2.381400
H 5.408100 -1.416400 3.057400
H 5.628000 2.012400 -0.034900
H 5.397500 1.429500 -1.711100
H 7.798200 1.903000 -0.878500
H 7.508800 0.441200 -1.841400
H 8.883800 0.566400 0.582300
H 6.996000 0.901500 2.026200
H 7.522000 -0.801400 2.210600
H 8.971400 -1.593600 0.363700
H 4.580500 -1.020100 -2.120800
H 4.650000 -2.191100 -0.750900
H 6.129300 -1.501800 -1.414900
H -0.081400 -2.044000 -0.925300
H -0.029200 -0.819700 -2.228000
H 1.475400 -1.505000 -1.611900
H -7.455400 -0.018600 -1.552300
H -9.333000 -0.932900 -0.148500
H -8.831200 0.680400 0.408100
H -8.300100 -0.782500 1.324200
H -6.489400 -2.435700 0.098000
H -6.251700 -2.103000 -1.672300
H -7.864100 -2.521500 -1.066900
*
```
