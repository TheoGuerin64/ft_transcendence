all: start

start:
	docker compose up --build -d

stop:
	docker compose down

re: fclean start

logs:
	docker compose logs -f

clean: stop
	docker system prune -f --volumes

fclean: stop
	docker system prune -af
	docker system prune -af --volumes

.PHONY: all start stop re logs clean fclean
