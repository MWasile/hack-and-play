FROM node:20-alpine AS deps

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm ci --prefer-offline --no-audit --progress=false

FROM deps AS build

COPY . .

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM deps AS development

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host=0.0.0.0"]
