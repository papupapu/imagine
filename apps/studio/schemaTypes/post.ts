import {defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'author', type: 'reference', to: [{type: 'author'}]}),
    defineField({name: 'coverImage', type: 'image', options: {hotspot: true}, fields: [
      defineField({name: 'alt', type: 'string', title: 'Alt text'}),
    ]}),
    defineField({name: 'excerpt', type: 'text', rows: 3}),
    defineField({name: 'body', type: 'array', of: [
      {type: 'block'},
      {type: 'image', options: {hotspot: true}},
      {type: 'code'},
    ]}),
    defineField({name: 'categories', type: 'array', of: [{type: 'reference', to: [{type: 'category'}]}]}),
    defineField({name: 'publishedAt', type: 'datetime'}),
    defineField({name: 'featured', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'title', author: 'author.name', media: 'coverImage'},
    prepare({title, author, media}) {
      return {title, subtitle: author ? `by ${author}` : '', media}
    },
  },
  orderings: [{title: 'Published (newest)', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
})
