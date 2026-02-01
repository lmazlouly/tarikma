module.exports = {
  tarikma: {
    input: {
      target: 'http://localhost:8080/v3/api-docs',
      override: {
        transformer: './orval.transformer.cjs',
      },
    },
    output: {
      mode: 'tags-split',
      client: 'react-query',
      target: 'src/shared/api/generated.ts',
      schemas: 'src/shared/api/model',
      override: {
        mutator: {
          path: './src/shared/api/orval-mutator.ts',
          name: 'customInstance',
        },
      },
    },
  },
}
