import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import NotFoundScreen from '@/app/+not-found';

describe('screens', () => {
  it('the home screen renders', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Somos R')).toBeTruthy();
  });

  it('the not-found screen offers a way back', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText('Esta pantalla no existe.')).toBeTruthy();
    expect(screen.getByText('Ir al inicio')).toBeTruthy();
  });
});
