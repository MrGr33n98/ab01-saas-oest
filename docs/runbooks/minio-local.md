# MinIO local (MVP uploads)

## Start

```bash
docker compose up -d minio minio-init db redis
```

- API: http://localhost:9000  
- Console: http://localhost:9001 (user `dronehub` / `dronehubsecret`)  
- Bucket: `dronehub-mvp` (created by `minio-init`)

## Backend env

```bash
export S3_ENDPOINT=http://localhost:9000
export S3_BUCKET=dronehub-mvp
export S3_ACCESS_KEY_ID=dronehub
export S3_SECRET_ACCESS_KEY=dronehubsecret
export S3_REGION=us-east-1
export S3_FORCE_PATH_STYLE=true
```

## Flow

1. `POST .../deliverables/upload-sessions` → `upload_url` + `storage_key`
2. Client `PUT` binary to `upload_url` with matching `Content-Type`
3. `POST finalize` with `storage_key` + checksum

Presign implementation: `Integrations::Storage::S3Presigner` (SigV4, path-style for MinIO).
