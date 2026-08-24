from contextlib import asynccontextmanager
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import deputados, eleicoes, representatividade, votacoes


def precarregar_cache():
    from .services.camara_service import get_proposicoes_mulheres

    print("Pre-carregando cache de votacoes...")
    get_proposicoes_mulheres()
    print("Cache de votacoes pronto!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    thread = threading.Thread(target=precarregar_cache, daemon=True)
    thread.start()
    yield


app = FastAPI(title="Radar Delas API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deputados.router, prefix="/api")
app.include_router(eleicoes.router, prefix="/api")
app.include_router(representatividade.router, prefix="/api")
app.include_router(votacoes.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "Radar Delas API online"}
