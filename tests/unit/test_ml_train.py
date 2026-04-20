import pytest
import pandas as pd
from datetime import datetime
from unittest.mock import patch, ANY

from flask_app.ml.train_model import train


class TestTrainModelPipeline:
    """
    MLOps Pipeline Test.
    Objective: Verify the continuous flow of the training script (data ingestion ->
    feature engineering -> training -> metrics calculation), rather than testing
    the mathematical accuracy of the RandomForest model itself.
    """

    # Patch the file I/O operations to prevent the test from overwriting
    # the actual production model.pkl and metrics.json on the disk.
    @patch("flask_app.ml.train_model.joblib.dump")
    @patch("flask_app.ml.train_model.open")
    def test_train_pipeline_success(self, mock_open, mock_joblib):
        """
        Happy Path: Feed 501 rows of mock data to verify the entire pipeline
        executes successfully without any syntax or logic errors.
        """
        # 1. Arrange: Construct 501 rows of mock data to bypass the MIN_ROWS = 500 defense mechanism.
        num_rows = 501
        data = {
            "number": [42] * num_rows,
            "last_update": [datetime(2026, 4, 19, 12, 0, 0)] * num_rows,
            "available_bikes": [10] * num_rows,
            "bike_stands": [30] * num_rows,
            "temp": [12.0] * num_rows,
            "humidity": [75] * num_rows,
            "pressure": [1010] * num_rows,
            "wind_speed": [5.0] * num_rows,
            "rain_1h": [0.0] * num_rows
        }
        fake_df = pd.DataFrame(data)

        # 2. Act: Trigger the core training function
        metrics = train(fake_df)

        # 3. Assert: Validate the pipeline state
        # (1) Verify that evaluation metrics are successfully calculated and returned
        assert "rmse" in metrics
        assert "r2" in metrics
        assert "features" in metrics
        assert "importances" in metrics

        # (2) Verify the correct number of rows were processed
        assert metrics["training_rows"] > 0
        assert metrics["test_rows"] > 0

        # (3) Verify the file-saving interceptors worked
        # (The code attempted to save to disk, but our Mock intercepted it)
        mock_joblib.assert_called_once()
        mock_open.assert_called_once_with(
            ANY, "w"
        )

    def test_train_abort_low_rows(self):
        """
        Sad Path: Test the defensive mechanism. Ensure the script actively aborts
        (via sys.exit) if the dataset contains fewer than 500 rows.
        """
        # 1. Arrange: Construct a tiny dataframe with only 10 rows
        fake_df = pd.DataFrame({"number": [42] * 10})

        # 2. Act & Assert:
        # The logic of pytest.raises is: "I assert that the following block WILL throw a SystemExit."
        # If it does, the test passes. If it doesn't (meaning the defense failed), the test fails.
        with pytest.raises(SystemExit) as excinfo:
            train(fake_df)

        # Verify the exit code is exactly 1 (standard error exit code)
        assert excinfo.value.code == 1