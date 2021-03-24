# Start server here
port=$1
if [ $#  -ne  1 ]
then
  port=3000
fi

if [ $(uname -s) == "Darwin" ]
then
  open=open
else
  open=start
fi

node init.js && $open http://localhost:$port/