from fastapi import APIRouter, HTTPException
from collections import defaultdict
from ..services.camara_service import get_deputados_com_sexo

router = APIRouter()

TOTAL_CADEIRAS_CAMARA = 513

@router.get("/representatividade")
def representatividade():
    try:
        deputados = get_deputados_com_sexo()
        
        mulheres = [d for d in deputados if d.get("sexo") == "F"]
        homens = [d for d in deputados if d.get("sexo") == "M"]
        por_estado = defaultdict(lambda: {
            "uf": "",
            "mulheres": 0,
            "homens": 0,
            "total": 0,
            "percentual_mulheres": 0
        })

        for deputado in deputados:
            uf = deputado.get("siglaUf") or "N/I"
            por_estado[uf]["uf"] = uf
            por_estado[uf]["total"] += 1

            if deputado.get("sexo") == "F":
                por_estado[uf]["mulheres"] += 1
            elif deputado.get("sexo") == "M":
                por_estado[uf]["homens"] += 1

        distribuicao_estados = []
        for estado in por_estado.values():
            if estado["total"]:
                estado["percentual_mulheres"] = round(
                    estado["mulheres"] / estado["total"] * 100,
                    1
                )
            distribuicao_estados.append(estado)

        distribuicao_estados.sort(
            key=lambda estado: (-estado["percentual_mulheres"], estado["uf"])
        )
        
        # Usa 513 como denominador fixo (cadeiras constitucionais)
        percentual = round(len(mulheres) / TOTAL_CADEIRAS_CAMARA * 100, 1)
        
        return {
            "camara": {
                "mulheres": len(mulheres),
                "homens": len(homens),
                "total": TOTAL_CADEIRAS_CAMARA,
                "percentual_mulheres": percentual,
                "por_estado": distribuicao_estados
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
