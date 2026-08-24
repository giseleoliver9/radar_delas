from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
import unicodedata

import requests

BASE_URL = "https://dadosabertos.camara.leg.br/api/v2"
LEGISLATURA_ATUAL = 57
ANO_INICIAL_PROPOSICOES = 2020

# Cache em memoria
_cache_deputados = None
_cache_proposicoes = None
_cache_ranking_autores = {}
_cache_votos_mulheres = {}

TEMAS_KEYWORDS = {
    "Violência Doméstica": [
        "violencia domestica",
        "violencia contra mulher",
        "feminicidio",
        "maria da penha",
        "medida protetiva",
    ],
    "Igualdade Salarial": ["igualdade salarial", "discriminacao salarial"],
    "Saúde da Mulher": ["dignidade menstrual", "saude da mulher", "maternidade", "gestante"],
    "Licença Maternidade": ["licenca maternidade", "licenca parental", "salario maternidade"],
    "Educação": ["meninas", "mulheres na ciencia", "educacao feminina"],
    "Trabalho": ["trabalho da mulher", "emprego feminino", "assedio sexual"],
    "Direitos da Mulher": ["mulher", "mulheres"],
}


def get_deputados(sigla_sexo=None):
    todos = []
    pagina = 1

    params_base = {
        "itens": 100,
        "ordem": "ASC",
        "ordenarPor": "nome",
    }
    if sigla_sexo:
        params_base["siglaSexo"] = sigla_sexo

    while True:
        params = {**params_base, "pagina": pagina}
        response = requests.get(
            f"{BASE_URL}/deputados",
            params=params,
            headers={"Accept": "application/json"},
            timeout=10,
        )
        response.raise_for_status()

        dados = response.json().get("dados", [])
        if not dados:
            break

        todos.extend(dados)
        pagina += 1
        if len(dados) < 100:
            break

    deputados_por_id = {}
    for deputado in todos:
        deputados_por_id[deputado["id"]] = deputado

    return list(deputados_por_id.values())


def get_detalhe_deputado(dep):
    try:
        response = requests.get(
            f"{BASE_URL}/deputados/{dep['id']}",
            headers={"Accept": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        detalhe = response.json().get("dados", {})
        return {
            "id": dep["id"],
            "nome": dep["nome"],
            "siglaPartido": dep.get("siglaPartido"),
            "siglaUf": dep.get("siglaUf"),
            "urlFoto": dep.get("urlFoto"),
            "sexo": detalhe.get("sexo"),
        }
    except requests.RequestException:
        return {**dep, "sexo": None}


def get_deputados_com_sexo():
    global _cache_deputados

    if _cache_deputados is not None:
        return _cache_deputados

    deputados = get_deputados()
    ids_mulheres = {dep["id"] for dep in get_deputados("F")}
    ids_homens = {dep["id"] for dep in get_deputados("M")}

    resultado = []
    for dep in deputados:
        sexo = None
        if dep["id"] in ids_mulheres:
            sexo = "F"
        elif dep["id"] in ids_homens:
            sexo = "M"
        resultado.append({**dep, "sexo": sexo})

    _cache_deputados = sorted(resultado, key=lambda dep: dep.get("nome", ""))
    return _cache_deputados


def normalizar_texto(texto: str) -> str:
    texto = unicodedata.normalize("NFD", texto or "")
    texto = "".join(char for char in texto if unicodedata.category(char) != "Mn")
    return texto.lower()


def extrair_id_de_uri(uri):
    if not uri:
        return None
    try:
        return int(str(uri).rstrip("/").split("/")[-1])
    except (TypeError, ValueError):
        return None


def classificar_tema(ementa: str, tema_padrao: str = "Direitos da Mulher") -> str:
    ementa_lower = normalizar_texto(ementa)
    for tema, keywords in TEMAS_KEYWORDS.items():
        for keyword in keywords:
            if normalizar_texto(keyword) in ementa_lower:
                return tema
    return tema_padrao


def get_proposicoes_mulheres():
    global _cache_proposicoes

    if _cache_proposicoes is not None:
        return _cache_proposicoes

    buscas = [
        (keyword, tema)
        for tema, keywords in TEMAS_KEYWORDS.items()
        for keyword in keywords
    ]
    anos = range(date.today().year, ANO_INICIAL_PROPOSICOES - 1, -1)

    resultado = []
    ids_vistos = set()
    session = requests.Session()

    for palavra, tema in buscas:
        for ano in anos:
            try:
                response = session.get(
                    f"{BASE_URL}/proposicoes",
                    params={
                        "keywords": palavra,
                        "ano": ano,
                        "itens": 20,
                        "ordem": "DESC",
                        "ordenarPor": "id",
                    },
                    headers={"Accept": "application/json"},
                    timeout=10,
                )
                response.raise_for_status()
                dados = response.json().get("dados", [])
                for prop in dados:
                    pid = str(prop.get("id"))
                    if pid in ids_vistos:
                        continue
                    ids_vistos.add(pid)
                    ementa = prop.get("ementa", "Sem descrição disponível.")
                    resultado.append(
                        {
                            "id": pid,
                            "titulo": prop.get("siglaTipo", "")
                            + " "
                            + str(prop.get("numero", ""))
                            + "/"
                            + str(prop.get("ano", "")),
                            "tema": classificar_tema(ementa, tema),
                            "ementa": ementa,
                            "ano": prop.get("ano"),
                            "casa": "Câmara",
                        }
                    )
            except requests.RequestException:
                continue

    session.close()
    resultado.sort(
        key=lambda prop: (prop.get("ano") or 0, int(prop.get("id") or 0)),
        reverse=True,
    )
    _cache_proposicoes = resultado
    return _cache_proposicoes


def get_autores_proposicao(session, proposicao):
    try:
        response = session.get(
            f"{BASE_URL}/proposicoes/{proposicao['id']}/autores",
            headers={"Accept": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        return proposicao, response.json().get("dados", [])
    except requests.RequestException:
        return proposicao, []


def get_ranking_autores_mulheres(limite_proposicoes=350):
    global _cache_ranking_autores

    if limite_proposicoes in _cache_ranking_autores:
        return _cache_ranking_autores[limite_proposicoes]

    deputados = get_deputados_com_sexo()
    deputados_por_id = {dep["id"]: dep for dep in deputados}
    proposicoes = get_proposicoes_mulheres()[:limite_proposicoes]

    ranking = {}
    session = requests.Session()

    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = [
            executor.submit(get_autores_proposicao, session, proposicao)
            for proposicao in proposicoes
        ]
        for future in as_completed(futures):
            proposicao, autores = future.result()
            for autor in autores:
                autor_id = autor.get("id") or extrair_id_de_uri(autor.get("uri"))
                if autor_id not in deputados_por_id:
                    continue

                dep = deputados_por_id[autor_id]
                item = ranking.setdefault(
                    autor_id,
                    {
                        "id": autor_id,
                        "nome": dep.get("nome") or autor.get("nome"),
                        "siglaPartido": dep.get("siglaPartido"),
                        "siglaUf": dep.get("siglaUf"),
                        "urlFoto": dep.get("urlFoto"),
                        "sexo": dep.get("sexo"),
                        "total_proposicoes": 0,
                        "temas": {},
                        "anos": {},
                        "proposicoes": [],
                    },
                )
                item["total_proposicoes"] += 1
                item["temas"][proposicao["tema"]] = item["temas"].get(proposicao["tema"], 0) + 1
                item["anos"][str(proposicao["ano"])] = item["anos"].get(str(proposicao["ano"]), 0) + 1
                if len(item["proposicoes"]) < 5:
                    item["proposicoes"].append(proposicao)

    session.close()

    dados = sorted(
        ranking.values(),
        key=lambda item: (item["total_proposicoes"], item["nome"]),
        reverse=True,
    )
    _cache_ranking_autores[limite_proposicoes] = {
        "dados": dados,
        "total": len(dados),
        "total_proposicoes_analisadas": len(proposicoes),
    }
    return _cache_ranking_autores[limite_proposicoes]


def get_votacoes_da_proposicao(session, proposicao):
    try:
        response = session.get(
            f"{BASE_URL}/proposicoes/{proposicao['id']}/votacoes",
            headers={"Accept": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        return proposicao, response.json().get("dados", [])
    except requests.RequestException:
        return proposicao, []


def get_votos_da_votacao(session, proposicao, votacao):
    try:
        response = session.get(
            f"{BASE_URL}/votacoes/{votacao['id']}/votos",
            headers={"Accept": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        return proposicao, votacao, response.json().get("dados", [])
    except requests.RequestException:
        return proposicao, votacao, []


def get_votos_mulheres(limite_proposicoes=80):
    global _cache_votos_mulheres

    if limite_proposicoes in _cache_votos_mulheres:
        return _cache_votos_mulheres[limite_proposicoes]

    proposicoes = get_proposicoes_mulheres()[:limite_proposicoes]
    session = requests.Session()
    votacoes = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(get_votacoes_da_proposicao, session, proposicao)
            for proposicao in proposicoes
        ]
        for future in as_completed(futures):
            proposicao, dados_votacoes = future.result()
            for votacao in dados_votacoes:
                votacoes.append((proposicao, votacao))

    ranking = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(get_votos_da_votacao, session, proposicao, votacao)
            for proposicao, votacao in votacoes
        ]
        for future in as_completed(futures):
            proposicao, votacao, votos = future.result()
            for voto in votos:
                deputado = voto.get("deputado_") or voto.get("deputado") or {}
                deputado_id = deputado.get("id")
                if not deputado_id:
                    continue
                item = ranking.setdefault(
                    deputado_id,
                    {
                        "id": deputado_id,
                        "nome": deputado.get("nome"),
                        "siglaPartido": deputado.get("siglaPartido"),
                        "siglaUf": deputado.get("siglaUf"),
                        "urlFoto": deputado.get("urlFoto"),
                        "sim": 0,
                        "nao": 0,
                        "abstencao": 0,
                        "outros": 0,
                        "total_votos": 0,
                    },
                )
                tipo_voto = normalizar_texto(voto.get("tipoVoto", ""))
                item["total_votos"] += 1
                if tipo_voto == "sim":
                    item["sim"] += 1
                elif tipo_voto in {"nao", "não"}:
                    item["nao"] += 1
                elif "abstencao" in tipo_voto:
                    item["abstencao"] += 1
                else:
                    item["outros"] += 1

    session.close()

    dados = sorted(
        ranking.values(),
        key=lambda item: (item["total_votos"], item["sim"], item["nome"] or ""),
        reverse=True,
    )
    _cache_votos_mulheres[limite_proposicoes] = {
        "dados": dados,
        "total": len(dados),
        "total_proposicoes_analisadas": len(proposicoes),
        "total_votacoes_analisadas": len(votacoes),
        "observacao": "Contagem nominal bruta. A interpretação pró/contra mulheres exige curadoria do mérito de cada votação.",
    }
    return _cache_votos_mulheres[limite_proposicoes]
