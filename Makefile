SRC = qbert.js
MIN = qbert.min.js
MAP = qbert.min.map.js

min: $(SRC)
	uglifyjs $(SRC) -o $(MIN) --source-map=$(MAP)

.PHONY: clean
clean:
	rm qbert.min.js
	rm qbert.min.map.js