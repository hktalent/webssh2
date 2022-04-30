# How install
```bash
# npm install --production
yarn install --production

```

# How Run
```bash
# npm start
yarn start
```
## docker run
start
```bash
docker-compose up -d
```
stop
```bash
docker-compose down 
```


# mac os use X11
```bash
# brew cask install xquartz
brew install xquartz
# set xquartz port to default 6000
defaults write org.x.X11 nolisten_tcp 1
sudo defaults write org.x.X11 nolisten_tcp 1

open /Applications/Utilities/XQuartz.app
```
## in your remote server,eg:centOs
```bash
yum install -y xorg-x11-xauth
yum install -y mesa-libGL
yum -y install xeyes
vi /etc/ssh/ssh_config
# add
X11UseForwarding yes
X11Forwarding yes

service sshd restart
systemctl restart sshd
```
### test ssh X11,test server is ok
```
ewSshPort=261
newIp="14.134.16.111"
ssh -X -Y -i ~/.ssh/id_rsa -p $newSshPort -C root@${newIp}

# run in server
firefox
```

# to build client ts file
npm install -g typescript

cd app/client
# update to your new code
yarn build