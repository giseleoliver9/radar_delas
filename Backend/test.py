import requests

BASE_URL = "https://dadosabertos.camara.leg.br/api/v2"

buscas = [
    ("violencia domestica", "Violência Doméstica"),
    ("feminicidio", "Violência Doméstica"),
    ("salarial", "Igualdade Salarial"),
    ("menstrual", "Saúde da Mulher"),
    ("gestante", "Saúde da Mulher"),
    ("licenca", "Licença Maternidade"),
    ("assedio", "Trabalho"),
    ("mulheres", "Direitos da Mulher"),
]

anos = [2025, 2024, 2023]

for palavra, tema in buscas:
    for ano in anos:
        try:
            r = requests.get(
                f"{BASE_URL}/proposicoes",
                params={"keywords": palavra, "ano": ano, "itens": 3},
                timeout=8
            )
            dados = r.json().get("dados", [])
            print(f"{palavra} ({ano}): {len(dados)} resultados")
        except Exception as e:
            print(f"{palavra} ({ano}): ERRO - {e}")