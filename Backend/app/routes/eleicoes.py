from datetime import datetime
from pathlib import Path
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
LEADS_FILE = DATA_DIR / "eleicoes_2026_leads.json"

ESTADOS = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
    "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
    "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"
]

CARGOS_2026 = [
    "Presidencia",
    "Vice-presidencia",
    "Governo estadual",
    "Vice-governo estadual",
    "Senado",
    "Deputada federal",
    "Deputada estadual",
    "Deputada distrital",
]


class AlertaAtualizacao(BaseModel):
    nome: str | None = None
    email: str
    uf: str | None = None
    cargo: str | None = None


class CadastroCandidata(BaseModel):
    nome: str
    email: str
    uf: str
    cargo: str
    partido: str | None = None
    site_ou_rede: str | None = None


def salvar_lead(tipo: str, payload: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    registros = []

    if LEADS_FILE.exists():
        with LEADS_FILE.open("r", encoding="utf-8") as arquivo:
            registros = json.load(arquivo)

    registro = {
        "tipo": tipo,
        "criado_em": datetime.utcnow().isoformat(),
        "dados": payload,
    }
    registros.append(registro)

    with LEADS_FILE.open("w", encoding="utf-8") as arquivo:
        json.dump(registros, arquivo, ensure_ascii=False, indent=2)

    return registro


@router.get("/eleicoes/candidatas-2026")
def candidatas_2026():
    return {
        "ano": 2026,
        "status": "aguardando_dados_oficiais",
        "fonte_prevista": [
            "https://dadosabertos.tse.jus.br/",
            "https://divulgacandcontas.tse.jus.br/divulga/",
        ],
        "filtros": {
            "estados": ESTADOS,
            "cargos": CARGOS_2026,
        },
        "dados": [],
        "observacao": (
            "As candidaturas oficiais de 2026 devem ser importadas do TSE "
            "quando o conjunto oficial estiver disponível."
        ),
    }


@router.post("/eleicoes/alertas")
def criar_alerta(payload: AlertaAtualizacao):
    try:
        registro = salvar_lead("alerta_atualizacao", payload.dict())
        return {"ok": True, "registro": registro}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/eleicoes/cadastro-candidata")
def criar_cadastro_candidata(payload: CadastroCandidata):
    try:
        registro = salvar_lead("cadastro_candidata", payload.dict())
        return {
            "ok": True,
            "registro": registro,
            "mensagem": "Cadastro recebido para validação editorial.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
