import dataJson from './data/json/data.json';

const appRoutes = () => {
  const arr = [];
  for (let i = 0, len = Object.keys(dataJson).length; i < len; i += 1) {
    arr.push(`/note/${Object.keys(dataJson)[i]}`);
  }
  return arr;
};

export default {
  target: 'static',
  head: {
    meta: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, user-scalable=no',
      },
    ],
    link: [
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700&display=swap',
      },
    ],
  },
  modules: ['@nuxtjs/pwa'],
  workbox: {
    globPatterns: ['**/*.{js,css}', '**/img/*'],
    offlinePage: '/404.html',
    preCaching: ['/note/0001/', '/note/0002/', '/note/0003/', '/note/0004/'],
  },
  // pwa: {
  //   manifest: {
  //     orientation: 'landscape',
  //   },
  // },
  generate: {
    fallback: true,
    routes: appRoutes,
  },
};
