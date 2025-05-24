import os
import psycopg2
from psycopg2.extras import execute_values
import uuid
import json
from datetime import datetime, timezone
from azure.cosmos import CosmosClient, PartitionKey
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

PGHOST=os.getenv("PGHOST_VM")
PGUSER=os.getenv("PGUSER_VM")
PGPORT=os.getenv("PGPORT_VM")
PGDATABASE=os.getenv("PGDATABASE_VM")
PGPASSWORD=os.getenv("PGPASSWORD_VM")

try:
    # PostgreSQL クライアント作成
    pg_conn = psycopg2.connect(
        user=PGUSER,
        password=PGPASSWORD,
        host=PGHOST,
        port=PGPORT,
        database=PGDATABASE
    )
    pg_conn.autocommit = True
    pg_cur = pg_conn.cursor()

    print("PostgreSQLに接続しました。")
except Exception as e:
    print("PostgreSQLに接続できませんでした。")
    print(e)


try:
    # CosmosDB 接続情報
    COSMOS_DB_ENDPOINT = os.getenv("COSMOS_DB_ENDPOINT")
    COSMOS_DB_KEY = os.getenv("COSMOS_DB_KEY")
    DATABASE_NAME = os.getenv("DATABASE_NAME")
    CONTAINER_NAME = os.getenv("CONTAINER_NAME")

    # CosmosDB クライアント作成
    cosmos_client = CosmosClient(COSMOS_DB_ENDPOINT, credential=COSMOS_DB_KEY)
    database = cosmos_client.get_database_client(DATABASE_NAME)
    container = database.get_container_client(CONTAINER_NAME)
    print("CosmosDBに接続しました。")
except Exception as e:
    print("CosmosDBに接続できませんでした。")
    print(e)



# CosmosDBから最初の3件だけ取得
query = "SELECT * FROM c OFFSET 0 LIMIT 3"
items = list(container.query_items(
    query=query,
    enable_cross_partition_query=True
))

print(f"取得したテスト用ドキュメント数: {len(items)} 件")

# # CosmosDBから全件取得
# query = "SELECT * FROM c"
# items = list(container.query_items(
#     query=query,
#     enable_cross_partition_query=True
# ))

# print(f"取得したドキュメント数: {len(items)} 件")

# データ整形してPostgreSQLに投入
for item in items:
    cosmos_user_id = uuid.UUID(item["id"])
    created_at = datetime.fromtimestamp(item["create_date"])

    # UserテーブルにInsert（idとoidに同じ値）
    pg_cur.execute("""
        INSERT INTO "User" (id, email, password)
        VALUES (%s, %s, %s)
        ON CONFLICT (id) DO NOTHING
    """, (
        str(cosmos_user_id),
        "test",  # emailはNULL
        None   # passwordもNULL
    ))

    # Chat用の新しいUUIDを生成
    chat_id = uuid.uuid4()

    # ChatテーブルにInsert
    pg_cur.execute("""
        INSERT INTO "Chat" (id, "createdAt", "userId", title, visibility)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING
    """, (
        str(chat_id),
        created_at,
        str(cosmos_user_id),
        item.get("name", ""),
        'private' if not item.get("display", False) else 'public'
    ))

    # MessageバルクInsert用の準備
    message_values = []

    # promptをsystem roleとして追加
    prompt_text = item.get("prompt")
    if prompt_text:
        message_id = uuid.uuid4()
        message_values.append((
            str(message_id),
            str(chat_id),
            "system",
            json.dumps(prompt_text, ensure_ascii=False),
            created_at
        ))

    # messagesを追加
    for msg in item.get("messages", []):
        message_id = uuid.uuid4()
        role = msg.get("role", "user")
        content = msg.get("content", "")

        message_values.append((
            str(message_id),
            str(chat_id),
            role,
            json.dumps(content, ensure_ascii=False),
            created_at
        ))

    # MessageをバルクInsert
    if message_values:
        execute_values(
            pg_cur,
            """
            INSERT INTO "Message" (id, "chatId", role, content, "createdAt")
            VALUES %s
            """,
            message_values
        )

print("全データの移行完了！🎉🚀")

# 後片付け
pg_cur.close()
pg_conn.close()
cosmos_client.close()
