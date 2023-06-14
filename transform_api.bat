echo "Transforming API"
python ./transformer.py lib/api.py > book_control/src/bridge.ts
echo "Done!"