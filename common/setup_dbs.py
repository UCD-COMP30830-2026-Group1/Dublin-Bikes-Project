from sqlalchemy import create_engine, text
import sys
import os

current_path = os.path.abspath(__file__)
common_dir = os.path.dirname(current_path)
root_dir = os.path.dirname(common_dir)
sys.path.append(root_dir)

import dbinfo


def create_databases():
    # 1. connect to MySQL root
    engine = create_engine(dbinfo.URI_ROOT,echo=True)

    # 2.establish connection and execute create command
    with engine.connect() as conn:
        # create the ML database
        print(f"Creating the ML database: {dbinfo.DB_NAME_ML}")
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {dbinfo.DB_NAME_ML}"))

        # create 2-day database
        print(f"Creating the 2-day database")
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {dbinfo.DB_NAME_2DAY}"))

        # start the scheduler
        print("Enabling MySQL Event Scheduler...")
        conn.execute(text("SET GLOBAL event_scheduler = ON;"))
        print(f"Switching to database: {dbinfo.DB_NAME_ML}")
        conn.execute(text(f"USE {dbinfo.DB_NAME_ML}"))

        # Deploy a 7-day cleanup task
        print("Deploying 7-day data retention event...")
        cleanup_sql = """
                CREATE EVENT IF NOT EXISTS clean_7day_bikes
                ON SCHEDULE EVERY 1 DAY
                STARTS CURRENT_TIMESTAMP
                DO
                  DELETE FROM availability 
                  WHERE last_update < (NOW() - INTERVAL 7 DAY);
                """
        conn.execute(text(cleanup_sql))

        print("\n Current Databases on Server:")
        for res in conn.execute(text("SHOW DATABASES")):
            print(res)

if __name__ =="__main__":
    create_databases()