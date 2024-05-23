# mrxbet

## To access your instance:

**mrxbet Dev Server :**
https://mrxbet.com
https://mrxbet.com
chmod 400 MrXBetExclusiveBetAndDB.pem
ec2-52-19-123-232.eu-west-1.compute.amazonaws.com
Example:
ssh -i "MrXBetExclusiveBetAndDB.pem" ec2-user@ec2-52-19-123-232.eu-west-1.compute.amazonaws.com
Path: /var/www/html/MrXBet

MrXBet-Prod
https://preprod.mrxbet.com
chmod 400 MrXBet-Prod.pem
15.188.249.84
ec2-15-188-249-84.eu-west-3.compute.amazonaws.com
Example:
ssh -i "MrXBet-Prod.pem" ec2-user@ec2-15-188-249-84.eu-west-3.compute.amazonaws.com
Path: /var/www/html/MrXBet

**New Server MrXBet-Prod :**
IP(s) : 212.31.104.144
User: root
Password : WlHKYdmD5O
https://preprod.mrxbet.com
Path: /var/www/MrXBet.com/MrXBet

**New Server MrXBet-Live :**
IP(s) : 212.31.104.144
User: root
Password : WlHKYdmD5O
https://www.mrxbet.com
Path: /var/www/live/MrXBet.com/MrXBet

**Setup AWS linux server :**
- sudo yum update -y
- sudo yum install nginx
- sudo yum install git -y
- sudo yum install gcc-c++
- sudo curl -sL https://rpm.nodesource.com/setup_8.x | bash -
- sudo yum install -y nodejs
- sudo npm install -g node-gyp
- sudo npm install pm2 -g

**Add NGINX and PHP-FPM service start to boot sequence**
- sudo chkconfig nginx on
- sudo chkconfig php-fpm on
- sudo chkconfig mysqld on

**Nginx service :**
- sudo service nginx start
- sudo service nginx restart

**Deploy git :**
- git clone https://github.com/Totoit/MrXBet.git
- git checkout dev (dev, stage, master)
- cd /var/www/html/MrXBet
- sudo git pull
- sudo npm install
- sudo npm run build
- sudo pm2 start --name "dev-web" npm -- start

# Service API for fetch data from Wordpress

# To install please run:
- sudo npm i -g --unsafe-perm=true --allow-root

**Fixed sass build error**
- sudo npm rebuild node-sass

# To run locally
- npm run dev

# for production
- sudo npm run build
- sudo pm2 start --name "live-web" npm -- start

# for pre-prod
- sudo npm run build
- sudo pm2 start --name "pre-prod-web" npm -- start

**Dev Setup nginx.conf :**
-   server {
        listen 80;
        listen [::]:80;
        server_name mrxbet.com; 
        return 301 https://mrxbet.com$request_uri;
    }
-   server {
        listen       [::]:443 ssl http2;
        listen       443 ssl http2;
        server_name mrxbet.com;
        root   /var/www/html/MrXBet;
        ssl_certificate "/var/www/html/MrXBet/cloudflare/certificate.pem";
        ssl_certificate_key "/var/www/html/MrXBet/cloudflare/private.key";
        location / {
            proxy_pass http://localhost:3002;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
}