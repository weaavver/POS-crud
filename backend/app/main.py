from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, products, orders, deals, assistant
import os

app = FastAPI(title="POS Games & E-book Shop API")

# Local dev is always allowed. In production, FRONTEND_URL adds the deployed site.
origins = ["http://localhost:5173", "https://vault-weaavver.vercel.app"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Vercel branch + per-deploy URLs: vault-git-<branch>-weaavver / vault-<hash>-weaavver
    allow_origin_regex=r"https://vault(-[a-z0-9-]+)?-weaavver\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(deals.router)
app.include_router(assistant.router)

@app.get("/")
async def root():
    return {"message": "POS API is running"}