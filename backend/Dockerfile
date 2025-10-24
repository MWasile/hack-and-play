FROM ghcr.io/astral-sh/uv:bookworm-slim AS builder

WORKDIR /backend

COPY pyproject.toml .python-version uv.lock ./

RUN uv sync --frozen --no-cache

FROM builder AS development

COPY --from=builder /backend/.venv /backend/.venv
COPY --from=builder /backend/pyproject.toml /backend/pyproject.toml
COPY --from=builder /backend/.python-version /backend/.python-version
COPY --from=builder /backend/uv.lock /backend/uv.lock

COPY . /backend

WORKDIR /backend

CMD ["sh", "-c", "uv run alembic -c alembic.ini upgrade head && uv run fastapi run main.py --host 0.0.0.0 --port 5001"]
