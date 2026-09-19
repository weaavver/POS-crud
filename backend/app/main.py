from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, products, orders

app = FastAPI(title="POS Games & E-book Shop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)


@app.get("/")
async def root():
    return {"message": "POS API is running"}