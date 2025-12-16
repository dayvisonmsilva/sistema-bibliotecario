import AuthGuard from '../../../components/auth/AuthGuard';
import BookForm from '../../../components/livros/BookForm';

const CreateBookPage = () => {
  return (
    <AuthGuard allowedRoles={['bibliotecario']}>
      <BookForm />
    </AuthGuard>
  );
};

export default CreateBookPage;