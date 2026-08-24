from fastapi import APIRouter, HTTPException, Query
from ..services.camara_service import (
    get_proposicoes_mulheres,
    get_ranking_autores_mulheres,
    get_votos_mulheres,
)
import app.services.camara_service as camara_service

router = APIRouter()


@router.get("/votacoes-mulheres")
def votacoes_mulheres(
    tema: str | None = Query(default=None),
    ano: int | None = Query(default=None),
    casa: str | None = Query(default=None),
):
    try:
        proposicoes = get_proposicoes_mulheres()
        filtradas = [
            proposicao
            for proposicao in proposicoes
            if (tema is None or proposicao.get("tema") == tema)
            and (ano is None or proposicao.get("ano") == ano)
            and (casa is None or proposicao.get("casa") == casa)
        ]
        filtros = {
            "temas": sorted({p.get("tema") for p in proposicoes if p.get("tema")}),
            "anos": sorted({p.get("ano") for p in proposicoes if p.get("ano")}, reverse=True),
            "casas": sorted({p.get("casa") for p in proposicoes if p.get("casa")}),
        }
        return {"dados": filtradas, "total": len(filtradas), "filtros": filtros}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/votacoes-mulheres/reset")
def reset_cache():
    camara_service._cache_proposicoes = None
    camara_service._cache_ranking_autores = {}
    camara_service._cache_votos_mulheres = {}
    return {"status": "cache limpo"}


@router.get("/parlamentares-mulheres/ranking-proposicoes")
def ranking_proposicoes_mulheres(
    limite_proposicoes: int = Query(default=350, ge=1, le=1000),
):
    try:
        return get_ranking_autores_mulheres(limite_proposicoes=limite_proposicoes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/parlamentares-mulheres/votos")
def votos_mulheres(
    limite_proposicoes: int = Query(default=80, ge=1, le=300),
):
    try:
        return get_votos_mulheres(limite_proposicoes=limite_proposicoes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
