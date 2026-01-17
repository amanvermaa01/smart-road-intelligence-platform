from app.scoring.confidence import compute_confidence

def test_high_trust_duplicate():
    score = compute_confidence(0.8, 0.2, 1.0, 5)
    assert score > 0.85
