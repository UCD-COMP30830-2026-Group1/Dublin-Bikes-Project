#!/usr/bin/env python3
# data_scripts/automation/retrain_model.py
#
# Weekly retraining — queries live DB, retrains, overwrites model.pkl.
# Cron (run every Sunday 3am):
#   0 3 * * 0  cd /path/to/project && python data_scripts/automation/retrain_model.py >> /var/log/retrain.log 2>&1

import os, sys, logging

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir    = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(root_dir)

import dbinfo
from sqlalchemy import create_engine
from flask_app.ml.train_model import load_from_db, train

logging.basicConfig(level=logging.INFO, format="%(asctime)s [RETRAIN] %(message)s")
log = logging.getLogger(__name__)

if __name__ == "__main__":
    log.info("=== Weekly retraining started ===")
    try:
        engine = create_engine(dbinfo.URI_ML)
        df = load_from_db(engine)
        metrics = train(df)
        log.info(f"=== Done. RMSE={metrics['rmse']}  R²={metrics['r2']} ===")
        sys.exit(0)
    except Exception as e:
        log.error(f"=== FAILED: {e} ===")
        sys.exit(1)