all: start

start:
	docker compose up --build -d

stop:
	docker compose down

log:
	docker compose logs -f

shell:
	@if [ -z "$(APP)" ]; then \
		echo "APP is not set"; \
		exit 1; \
	fi
	docker exec -it $(APP) sh

format:
	npm --prefix volumes/nestjs run format
	npm --prefix volumes/vue run format

lint:
	npm --prefix volumes/nestjs run lint
	npm --prefix volumes/vue run lint

clean:
	docker system prune -af
	docker volume prune

re: stop clean start

.PHONY: all start stop log shell format lint clean re
