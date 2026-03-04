import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BlogService } from '@/services/blogService'
import type { Post, Category, Tag, Comment } from '@/types/blog'

const mockFrom = vi.fn()
const mockAdminFrom = vi.fn()
const mockRpc = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
  getSupabaseAdmin: () => ({
    from: (...args: unknown[]) => mockAdminFrom(...args),
  }),
}))

vi.mock('@/lib/logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const mockPost: Post = {
  id: '1',
  title: 'Post 1',
  slug: 'post-1',
  content: '',
  author_id: 'a1',
  status: 'published',
  view_count: 0,
  created_at: '',
  updated_at: '',
}

const rawPost = { ...mockPost, post_categories: [], post_tags: [] }

beforeEach(() => {
  mockFrom.mockReset()
  mockAdminFrom.mockReset()
})

describe('BlogService', () => {
  it('getPostById retorna post quando existe', async () => {
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: rawPost, error: null }),
        }),
      }),
    })
    const result = await new BlogService().getPostById('1')
    expect(result?.id).toBe('1')
  })

  it('getPostById retorna null quando PGRST116', async () => {
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      }),
    })
    const result = await new BlogService().getPostById('1')
    expect(result).toBeNull()
  })

  it('getPostById lança quando outro erro', async () => {
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'OTHER', message: 'db error' },
          }),
        }),
      }),
    })
    await expect(new BlogService().getPostById('1')).rejects.toEqual({
      code: 'OTHER',
      message: 'db error',
    })
  })

  it('getAllPublishedPosts retorna lista de posts', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [mockPost], error: null }),
        }),
      }),
    })
    const result = await new BlogService().getAllPublishedPosts()
    expect(result).toHaveLength(1)
  })

  it('getAllPublishedPosts lança quando supabase retorna error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        }),
      }),
    })
    await expect(new BlogService().getAllPublishedPosts()).rejects.toEqual({
      message: 'db error',
    })
  })

  it('getAllCategories retorna categorias', async () => {
    const cats: Category[] = [{ id: '1', name: 'Cat', slug: 'cat', created_at: '' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: cats, error: null }),
      }),
    })
    const result = await new BlogService().getAllCategories()
    expect(result).toEqual(cats)
  })

  it('getAllCategories lança quando supabase retorna error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      }),
    })
    await expect(new BlogService().getAllCategories()).rejects.toEqual({
      message: 'db error',
    })
  })

  it('getAllTags retorna tags', async () => {
    const tags: Tag[] = [{ id: '1', name: 'Tag', slug: 'tag', created_at: '' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: tags, error: null }),
      }),
    })
    const result = await new BlogService().getAllTags()
    expect(result).toEqual(tags)
  })

  it('getAllTags lança quando supabase retorna error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      }),
    })
    await expect(new BlogService().getAllTags()).rejects.toEqual({
      message: 'db error',
    })
  })

  it('getCommentsByPostId retorna comentários aprovados', async () => {
    const comments: Comment[] = [
      {
        id: '1',
        post_id: 'p1',
        author_name: 'A',
        author_email: 'a@a.com',
        content: 'C',
        status: 'approved',
        created_at: '',
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: comments, error: null }),
          }),
        }),
      }),
    })
    const result = await new BlogService().getCommentsByPostId('p1')
    expect(result).toEqual(comments)
  })

  it('getCommentsByPostId lança quando supabase retorna error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
          }),
        }),
      }),
    })
    await expect(new BlogService().getCommentsByPostId('p1')).rejects.toEqual({
      message: 'db error',
    })
  })

  it('createPost cria post e retorna', async () => {
    const created = { ...rawPost, id: 'new-id' }
    mockAdminFrom
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      })
    const result = await new BlogService().createPost(
      { title: 'T', content: 'C', status: 'draft' },
      'author-1'
    )
    expect(result.id).toBe('new-id')
  })

  it('createPost lança quando insert falha', async () => {
    mockAdminFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'insert error' },
          }),
        }),
      }),
    })
    await expect(
      new BlogService().createPost({ title: 'T', content: 'C' }, 'author-1')
    ).rejects.toEqual({ message: 'insert error' })
  })

  it('updatePost atualiza e retorna post', async () => {
    const updated = { ...rawPost, title: 'Updated' }
    mockAdminFrom
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updated, error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      })
    const result = await new BlogService().updatePost({
      id: '1',
      title: 'Updated',
    })
    expect(result.title).toBe('Updated')
  })

  it('updatePost lança quando update falha', async () => {
    mockAdminFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'update error' },
            }),
          }),
        }),
      }),
    })
    await expect(new BlogService().updatePost({ id: '1', title: 'X' })).rejects.toEqual({
      message: 'update error',
    })
  })

  it('publishPost atualiza status e retorna post', async () => {
    mockAdminFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...rawPost, status: 'published' },
              error: null,
            }),
          }),
        }),
      }),
    })
    const result = await new BlogService().publishPost('1')
    expect(result.status).toBe('published')
  })

  it('publishPost lança quando update falha', async () => {
    mockAdminFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'publish error' },
            }),
          }),
        }),
      }),
    })
    await expect(new BlogService().publishPost('1')).rejects.toEqual({
      message: 'publish error',
    })
  })

  it('schedulePost atualiza e retorna post', async () => {
    mockAdminFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...rawPost, status: 'scheduled' },
              error: null,
            }),
          }),
        }),
      }),
    })
    const result = await new BlogService().schedulePost('1', '2025-01-01T00:00:00Z')
    expect(result.status).toBe('scheduled')
  })

  it('schedulePost lança quando update falha', async () => {
    mockAdminFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'schedule error' },
            }),
          }),
        }),
      }),
    })
    await expect(new BlogService().schedulePost('1', '2025-01-01')).rejects.toEqual({
      message: 'schedule error',
    })
  })

  it('deletePost remove post sem erro', async () => {
    mockAdminFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    await expect(new BlogService().deletePost('1')).resolves.toBeUndefined()
  })

  it('deletePost lança quando delete falha', async () => {
    mockAdminFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'delete error' } }),
      }),
    })
    await expect(new BlogService().deletePost('1')).rejects.toEqual({
      message: 'delete error',
    })
  })

  it('createCategory insere e retorna categoria', async () => {
    const cat: Category = { id: '1', name: 'Cat', slug: 'cat', created_at: '' }
    mockAdminFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: cat, error: null }),
        }),
      }),
    })
    const result = await new BlogService().createCategory({ name: 'Cat' })
    expect(result).toEqual(cat)
  })

  it('createCategory lança quando insert falha', async () => {
    mockAdminFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'cat error' },
          }),
        }),
      }),
    })
    await expect(new BlogService().createCategory({ name: 'Cat' })).rejects.toEqual({
      message: 'cat error',
    })
  })

  it('deleteCategory remove categoria sem erro', async () => {
    mockAdminFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    await expect(new BlogService().deleteCategory('1')).resolves.toBeUndefined()
  })

  it('deleteCategory lança quando delete falha', async () => {
    mockAdminFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'del cat error' } }),
      }),
    })
    await expect(new BlogService().deleteCategory('1')).rejects.toEqual({
      message: 'del cat error',
    })
  })

  it('createTag insere e retorna tag', async () => {
    const tag: Tag = { id: '1', name: 'Tag', slug: 'tag', created_at: '' }
    mockAdminFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: tag, error: null }),
        }),
      }),
    })
    const result = await new BlogService().createTag('Tag')
    expect(result).toEqual(tag)
  })

  it('createTag lança quando insert falha', async () => {
    mockAdminFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'tag error' },
          }),
        }),
      }),
    })
    await expect(new BlogService().createTag('Tag')).rejects.toEqual({
      message: 'tag error',
    })
  })

  it('createComment insere e retorna comentário', async () => {
    const comment: Comment = {
      id: '1',
      post_id: 'p1',
      author_name: 'A',
      author_email: 'a@a.com',
      content: 'C',
      status: 'pending',
      created_at: '',
    }
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: comment, error: null }),
        }),
      }),
    })
    const result = await new BlogService().createComment({
      post_id: 'p1',
      author_name: 'A',
      author_email: 'a@a.com',
      content: 'C',
    })
    expect(result).toEqual(comment)
  })

  it('createComment lança quando insert falha', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'comment error' },
          }),
        }),
      }),
    })
    await expect(
      new BlogService().createComment({
        post_id: 'p1',
        author_name: 'A',
        author_email: 'a@a.com',
        content: 'C',
      })
    ).rejects.toEqual({ message: 'comment error' })
  })

  it('moderateComment atualiza e retorna comentário', async () => {
    const comment: Comment = {
      id: '1',
      post_id: 'p1',
      author_name: 'A',
      author_email: 'a@a.com',
      content: 'C',
      status: 'approved',
      created_at: '',
    }
    mockAdminFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: comment, error: null }),
          }),
        }),
      }),
    })
    const result = await new BlogService().moderateComment('1', 'approved')
    expect(result.status).toBe('approved')
  })

  it('moderateComment lança quando update falha', async () => {
    mockAdminFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'mod error' },
            }),
          }),
        }),
      }),
    })
    await expect(new BlogService().moderateComment('1', 'approved')).rejects.toEqual({
      message: 'mod error',
    })
  })

  it('incrementViewCount não lança quando rpc retorna error', async () => {
    mockRpc.mockResolvedValueOnce({ error: { message: 'rpc fail' } })
    await expect(new BlogService().incrementViewCount('post-1')).resolves.toBeUndefined()
  })
})
