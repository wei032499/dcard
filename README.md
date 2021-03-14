# Dcard middleware
* Dcard 每天午夜都有大量使用者湧入抽卡，為了不讓伺服器過載，請設計一個 middleware：
* 限制每小時來自同一個 IP 的請求數量不得超過 1000
* 在 response headers 中加入剩餘的請求數量 (X-RateLimit-Remaining) 以及 rate limit 歸零的時間 (X-RateLimit-Reset)
* 如果超過限制的話就回傳 429 (Too Many Requests)
* 可以使用各種資料庫達成

## 概述(Overview)
1. 使用MySQL資料庫。
2. Node.js 框架: express。

## 建立資料表
#### 資料表結構：
    CREATE TABLE `ratelimit` (
      `ip` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
      `remaining` int(10) UNSIGNED NOT NULL DEFAULT '1000',
      `resetT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
#### 資料表索引：
    ALTER TABLE `ratelimit`
      ADD PRIMARY KEY (`ip`);

## Screenshot
![homepage](https://raw.githubusercontent.com/wei032499/dcard/main/screenshot/homepage.png)