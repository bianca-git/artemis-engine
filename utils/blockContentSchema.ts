export default {
  name: 'blockContent',
  type: 'array',
  jsonType: 'array' as const,
  of: [
    {
      type: 'block',
      jsonType: 'object' as const,
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            jsonType: 'object' as const,
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                jsonType: 'string' as const,
              },
            ],
          },
        ],
      },
    },
    {
      type: 'image',
      jsonType: 'object' as const,
      fields: [
        {
          name: 'alt',
          type: 'string',
          jsonType: 'string' as const,
          title: 'Alt text',
        },
      ],
    },
  ],
};