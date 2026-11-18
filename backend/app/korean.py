"""Korean particles chosen by the final consonant (받침) of the last syllable."""


def _has_final_consonant(word: str) -> bool:
    last = word.strip()[-1:]
    if not last or not ("가" <= last <= "힣"):
        return False
    return (ord(last) - 0xAC00) % 28 != 0


def with_topic(word: str) -> str:
    return word + ("은" if _has_final_consonant(word) else "는")


def with_subject(word: str) -> str:
    return word + ("이" if _has_final_consonant(word) else "가")


def with_object(word: str) -> str:
    return word + ("을" if _has_final_consonant(word) else "를")
