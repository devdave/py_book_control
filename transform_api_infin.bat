echo "Transforming API"
python ./transformer.py lib/api.py > infinui/src/lib/api_bridge.ts
echo "Done!"