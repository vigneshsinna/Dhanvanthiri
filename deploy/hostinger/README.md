# Hostinger Deployment Layout

```text
/home/<user>/
  apps/dhanvanthiri/backend/      # Laravel project root
  public_html/                    # React build output (index.html + assets)
  public_html/api/                # Laravel public front controller + .htaccess
  logs/
    scheduler.log
    queue.log
```

## Cron entries

```cron
* * * * * flock -n /tmp/laravel_schedule.lock sh -c 'cd /home/<user>/apps/dhanvanthiri/backend && /usr/bin/php artisan schedule:run >> /home/<user>/logs/scheduler.log 2>&1'
* * * * * flock -n /tmp/laravel_queue.lock sh -c 'cd /home/<user>/apps/dhanvanthiri/backend && /usr/bin/php artisan queue:work database --stop-when-empty --queue=high,notifications,default --tries=3 --backoff=5 --max-time=50 --memory=128 >> /home/<user>/logs/queue.log 2>&1'
```
