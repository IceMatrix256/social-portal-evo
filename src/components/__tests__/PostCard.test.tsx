import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { PostCard } from '../PostCard';

describe('PostCard', () => {
  it('renders without crashing', () => {
    const mockPost = {
      id: '123',
      author: 'testuser',
      content: 'Test post',
      timestamp: new Date(),
      source: 'test',
      url: 'http://example.com',
      media: [],
      originalData: {}
    };
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test post')).toBeInTheDocument();
  });
});
