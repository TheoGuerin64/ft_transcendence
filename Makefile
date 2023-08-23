all: start

start:
	docker compose up --build -d

stop:
	docker compose down

restart: stop start

re: stop fclean start

logs:
	docker compose logs -f

clean:
	docker system prune -f --volumes

fclean:
	docker system prune -af
	docker system prune -af --volumes

.PHONY: all start stop restart logs clean fclean
