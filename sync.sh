git reset --hard
git pull origin main
hugo*
sudo rm -rf /var/www/html/*
sudo cp -r public/* /var/www/html/