# Vanilla JS
This is example node.js server on [Vanilla JS](http://vanilla-js.com/)

Vanilla JS - is a fast, lightweight, cross-platform framework
for building incredible, powerful JavaScript applications.

# Общее описание
Сервер запускается на порту `8080` и принимает JSON методом `POST` на эндпоинт `/data`.
- В 60% случаев он отвечает `OK`.
- В 20% случаев отвечает `500` ошибкой.
- В 20% случаев "зависает" не отвечая ничего и не закрывая соединение.
Сервер логирует в терминал все полученные сообщения (те, на которые ответил `OK`).
При остановке сервера, сервер выводит среднее и медианое время пинга.

# Как запустить:
Сам сервер не использует внешних зависимостей, можем запустить его сразу:
``` npm run start ```

![Screenshot from 2021-12-06 10-38-36](https://user-images.githubusercontent.com/18545939/144813750-8d41c12e-f87b-4c5a-b830-a3eddc772f9f.png)

# Тесты
Тесты используют внешние зависимости прописанные в devDependencies. 

Поэтому, чтобы запустить тесты, предварительно выполните:
` npm i `

## Запуск тестов:

` npm run test `

![Screenshot from 2021-12-06 10-36-40](https://user-images.githubusercontent.com/18545939/144814085-0f9d0c7b-e2f5-4d26-9e49-a782b60e763d.png)

## Посчитать покрытие кода тестами: 

` npm run coverage `

![Screenshot from 2021-12-06 10-37-02](https://user-images.githubusercontent.com/18545939/144813964-26c84c12-4ea5-4773-b405-8fe730232387.png)

