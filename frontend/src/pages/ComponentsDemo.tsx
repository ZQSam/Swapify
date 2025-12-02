import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  Modal,
  LoadingSpinner,
  Toast,
  RatingStars,
  Badge,
  BookCard,
  SearchBar,
  Autocomplete,
} from '../components/ui';
import type { AutocompleteOption } from '../components/ui';

export default function ComponentsDemo() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [autocompleteValue, setAutocompleteValue] = useState('');

  const autocompleteOptions: AutocompleteOption[] = [
    { value: '1', label: 'Introduction to Algorithms', subtitle: 'CS 374' },
    { value: '2', label: 'Data Structures', subtitle: 'CS 225' },
    { value: '3', label: 'Web Programming', subtitle: 'CS 409' },
  ];

  return (
    <div
      style={{
        paddingTop: 'var(--topbar-h)',
        paddingBottom: 'var(--bottombar-h)',
        minHeight: '100vh',
        background: 'var(--color-gray-50)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>
          UI Components Demo
        </h1>

        
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Buttons
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="small">
              Small
            </Button>
            <Button variant="primary" size="large">
              Large
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </Card>

        
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Inputs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Email" placeholder="Enter your email" fullWidth />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              fullWidth
            />
            <Input
              label="With Error"
              placeholder="Enter something"
              error="This field is required"
              fullWidth
            />
          </div>
        </Card>

        
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Search & Autocomplete
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SearchBar
              placeholder="Search books..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Autocomplete
              label="Select a book"
              options={autocompleteOptions}
              value={autocompleteValue}
              onChange={setAutocompleteValue}
              placeholder="Type to search..."
            />
          </div>
        </Card>

        
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Badges & Ratings
          </h2>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Badge variant="available">Available</Badge>
            <Badge variant="closed">Closed</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <RatingStars rating={4.5} count={23} />
            <RatingStars rating={3.0} count={5} />
            <RatingStars rating={5.0} count={100} />
          </div>
        </Card>

        
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Modal & Toast
          </h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button onClick={() => setShowModal(true)}>Open Modal</Button>
            <Button variant="secondary" onClick={() => setShowToast(true)}>
              Show Toast
            </Button>
          </div>
        </Card>

        
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Loading Spinner
          </h2>
          <LoadingSpinner />
        </Card>

        
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '16px',
            marginTop: '32px',
          }}
        >
          Book Cards
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          <BookCard
            id="1"
            title="Introduction to Algorithms"
            author="Thomas H. Cormen"
            courseCode="CS 374"
            price={89.99}
            condition="Like New"
            status="available"
            seller={{
              nickname: "John Doe",
              averageRating: 4.8,
              ratingCount: 15,
            }}
          />
          <BookCard
            id="2"
            title="Data Structures and Algorithm Analysis"
            author="Mark Allen Weiss"
            courseCode="CS 225"
            price={45.0}
            condition="Good"
            status="available"
            seller={{
              nickname: "Jane Smith",
              averageRating: 4.5,
              ratingCount: 8,
            }}
          />
          <BookCard
            id="3"
            title="Clean Code"
            author="Robert C. Martin"
            courseCode="CS 409"
            price={35.0}
            condition="Fair"
            status="closed"
            seller={{
              nickname: "Bob Wilson",
              averageRating: 5.0,
              ratingCount: 3,
            }}
          />
        </div>

        
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Example Modal"
        >
          <p style={{ marginBottom: '16px' }}>
            This is a modal dialog. You can close it by clicking the X button, clicking outside, or pressing Escape.
          </p>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </Modal>

        
        {showToast && (
          <Toast
            message="Operation completed successfully!"
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
}
