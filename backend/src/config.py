from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus

from pydantic import AliasChoices, Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_ENV_DIR = _PROJECT_ROOT / "envs" / "backend"
_ENV_MAIN = _ENV_DIR / "db.env"
_ENV_FALLBACK = _ENV_DIR / "db.env-default"
_ENV_FILE = _ENV_MAIN if _ENV_MAIN.exists() else _ENV_FALLBACK


class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    HOST: str = Field(validation_alias="POSTGRES_HOST")
    PORT: int = Field(validation_alias="POSTGRES_PORT")
    NAME: str = Field(validation_alias="POSTGRES_DB")
    USER: str = Field(validation_alias="POSTGRES_USER")
    PASSWORD: str = Field(validation_alias="POSTGRES_PASSWORD")

    @computed_field
    @property
    def url_async(self) -> str:
        return (
            f"postgresql+asyncpg://{quote_plus(self.USER)}:{quote_plus(self.PASSWORD)}"
            f"@{self.HOST}:{self.PORT}/{self.NAME}"
        )


class AppSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DEBUG: bool = Field(default=True, validation_alias=AliasChoices("DEBUG", "APP_DEBUG"))
    DB: DatabaseSettings = DatabaseSettings()

    @computed_field
    @property
    def sqlalchemy_url(self) -> str:
        return self.DB.url_async



@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    return AppSettings()


settings = get_settings()
