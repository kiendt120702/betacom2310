-- Tăng giới hạn file size cho bucket training-videos lên 1GB
UPDATE storage.buckets 
SET file_size_limit = 1073741824 -- 1GB = 1024*1024*1024 bytes
WHERE id = 'training-videos';