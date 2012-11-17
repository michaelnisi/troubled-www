#!/bin/sh

sudo yum update

sudo yum install zsh
sudo yum install tree
sudo yum install tmux

sudo yum install gcc-c++ 
sudo yum install git

git clone git://github.com/joyent/node.git    
cd node
git checkout v0.8.14
./configure

make
sudo make install
