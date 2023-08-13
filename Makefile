all: start

start: down
	docker compose up --build -d

down: 
	docker compose down

re: fclean start

logs:
	docker compose logs -f

clean: down
	docker system prune -f --volumes

fclean: down
	docker system prune -af --volumes

.PHONY: all start stop re logs clean fclean
