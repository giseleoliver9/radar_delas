from fastapi import APIRouter, HTTPException
from ..services.camara_service import get_deputados_com_sexo

router = APIRouter()

@router.get("/deputados")
def listar_deputados():
    try:
        dados = get_deputados_com_sexo()
        return {"dados": dados, "total": len(dados)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
