from app.scoring.duplicate import cluster_id




def test_same_cluster():
    c1 = cluster_id(28.61, 77.20, 1700000000)
    c2 = cluster_id(28.6101, 77.2001, 1700000020)
    assert c1 == c2