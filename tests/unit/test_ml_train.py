import pytest
import pandas as pd
from datetime import datetime
from unittest.mock import patch, MagicMock

from flask_app.ml.train_model import train_local_model, load_from_csv


class TestTrainModelPipeline:
    """
    MLOps Pipeline Test.
    Objective: Verify the training pipeline executes correctly
    without overwriting production model.pkl on disk.
    """

    def _make_fake_df(self, num_rows=501):
        """Helper: construct a valid mock dataframe."""
        return pd.DataFrame({
            "number":           [42] * num_rows,
            "last_update":      [datetime(2026, 4, 19, 12, 0, 0)] * num_rows,
            "available_bikes":  [10] * num_rows,
            "bike_stands":      [30] * num_rows,
            "temp":             [12.0] * num_rows,
            "humidity":         [75] * num_rows,
            "wind_speed":       [5.0] * num_rows,
            "rain_1h":          [0.0] * num_rows,
        })

    @patch("flask_app.ml.train_model.joblib.dump")
    @patch("flask_app.ml.train_model.load_from_csv")
    def test_train_pipeline_success(self, mock_load_csv, mock_joblib):
        """
        Happy Path: Mock load_from_csv to return 501 rows,
        verify the full pipeline executes and model is saved.
        """
        # 1. Arrange: intercept CSV loading, inject fake dataframe
        mock_load_csv.return_value = self._make_fake_df(501)

        # 2. Act
        train_local_model()

        # 3. Assert: CSV loader was called once
        mock_load_csv.assert_called_once()

        # 4. Assert: model was saved to disk (intercepted by Mock)
        mock_joblib.assert_called_once()

    @patch("flask_app.ml.train_model.joblib.dump")
    @patch("flask_app.ml.train_model.load_from_csv")
    def test_train_pipeline_empty_df(self, mock_load_csv, mock_joblib):
        """
        Sad Path: If load_from_csv returns an empty dataframe,
        the pipeline should raise an exception rather than save a broken model.
        """
        # 1. Arrange: return empty dataframe
        mock_load_csv.return_value = pd.DataFrame()

        # 2. Act & Assert: should raise some exception (ValueError, SystemExit, etc.)
        with pytest.raises(Exception):
            train_local_model()

        # 3. Assert: model should NOT be saved
        mock_joblib.assert_not_called()


class TestLoadFromCsv:
    """
    Unit tests for the CSV loading and merging logic.
    """

    @patch("flask_app.ml.train_model.pd.read_csv")
    def test_load_merges_availability_and_weather(self, mock_read_csv):
        """
        Verify that load_from_csv correctly reads and merges
        availability.csv and weather_hourly.csv.
        """
        # 1. Arrange: mock two separate CSV reads
        avail_df = pd.DataFrame({
            "number":                  [42],
            "last_update":             ["2026-04-19 12:00:00"],
            "available_bikes":         [10],
            "available_bike_stands":   [5],
        })
        weather_df = pd.DataFrame({
            # Use string timestamp instead of Unix integer to avoid precision mismatch
            "dt":         ["2026-04-19 12:00:00"],
            "temp_max":   [12.0],
            "humidity":   [75],
            "wind_speed": [5.0],
            "rain_1h":    [0.0],
        })

        # Align both columns to the same datetime precision before merging
        avail_df["last_update"] = pd.to_datetime(avail_df["last_update"]).astype("datetime64[s]")
        weather_df["dt"] = pd.to_datetime(weather_df["dt"]).astype("datetime64[s]")

        # side_effect returns different values on successive calls
        mock_read_csv.side_effect = [avail_df, weather_df]

        # 2. Act
        result = load_from_csv("fake/path/")

        # 3. Assert: read_csv called twice (availability + weather)
        assert mock_read_csv.call_count == 2

        # 4. Assert: result contains expected columns
        for col in ["number", "last_update", "available_bikes",
                    "bike_stands", "temp", "humidity", "wind_speed", "rain_1h"]:
            assert col in result.columns