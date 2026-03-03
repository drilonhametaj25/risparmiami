"""Claude API client for rule extraction."""
import json
import anthropic
from config import ANTHROPIC_API_KEY

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


def extract_rules_from_text(text: str, source: str, category: str) -> list[dict]:
    """Use Claude to extract structured rules from unstructured text."""
    if not client:
        raise ValueError("ANTHROPIC_API_KEY not configured")

    prompt = f"""Analizza il seguente testo da {source} e estrai tutte le regole di risparmio/agevolazioni fiscali/bonus.

Per ogni regola, restituisci un oggetto JSON con:
- slug: identificativo univoco in kebab-case
- name: nome della regola
- shortDescription: descrizione breve (1-2 frasi)
- fullDescription: descrizione completa (2-4 frasi)
- category: "{category}"
- target: "persona" o "azienda" o "entrambi"
- maxAmount: importo massimo in euro (numero, null se non applicabile)
- certaintyLevel: "certo", "probabile" o "consiglio"
- howToClaim: come richiederlo (passi brevi)
- requiredDocs: lista di documenti necessari (array di stringhe)
- tags: lista di tag pertinenti (array di stringhe)

Restituisci SOLO un array JSON valido, nessun altro testo.

TESTO:
{text}"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.content[0].text
    return json.loads(content)
