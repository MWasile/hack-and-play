from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "World"}
