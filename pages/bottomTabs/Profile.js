import { Label, Input, Button } from 'tamagui';

import { useAuth } from '../../authProvider';
import { SafeScrollView } from '../../components/SafeScrollView';

const ProfilePage = () => {
  const authContext = useAuth();

  const logout = async () => {
    authContext.api.logout();
  };

  return (
    <SafeScrollView
      yCenter
      lrSafe
      lrIndent={15}>
      <Label>Роль</Label>
      <Input
        value={authContext.state.user?.role}
        inputMode="text"
        readOnly
      />
      <Label>Фамилия</Label>
      <Input
        value={authContext.state.user?.lastName}
        inputMode="text"
        readOnly
      />
      <Label>Имя</Label>
      <Input
        value={authContext.state.user?.firstName}
        inputMode="text"
        readOnly
      />
      <Label>Отчество</Label>
      <Input
        value={authContext.state.user?.middleName}
        inputMode="text"
        readOnly
      />
      <Label>Электронный адрес</Label>
      <Input
        name="email"
        value={authContext.state.user?.email}
        readOnly
      />
      <Button
        onPress={logout}
        marginTop={15}>
        Выйти
      </Button>
    </SafeScrollView>
  );
};

export { ProfilePage };
