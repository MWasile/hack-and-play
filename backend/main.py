from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.routes.district import router as districts_router


app = FastAPI()

app.include_router(districts_router, prefix="/api")


@app.get("/")
async def read_root():
    return {"Hello": "World"}
