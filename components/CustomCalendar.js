import axios from 'axios';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTheme } from 'tamagui';

import { useAuth } from '../authProvider';

LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  monthNamesShort: [
    'Янв.',
    'Фев.',
    'Март',
    'Апр.',
    'Май',
    'Июнь',
    'Июль',
    'Авг.',
    'Сент.',
    'Окт.',
    'Нояб.',
    'Дек.',
  ],
  dayNames: [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня',
};

LocaleConfig.defaultLocale = 'ru';

const CustomCalendar = React.memo(({ tripId }) => {
  const theme = useTheme();
  const [selectedDates, setSelectedDates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const backgroundStrong = theme.backgroundStrong.get();
  const color = theme.color.get();
  const blue = theme.blue11.get();
  const key = useMemo(() => `${backgroundStrong}-${color}-${blue}`, [theme]);
  const [error, setError] = useState(false);
  const authContext = useAuth();
  const axiosInstance = axios.create({
    baseURL:
      Platform.OS === 'ios'
        ? 'http://127.0.0.1:8000/api'
        : 'http://10.0.2.2:8000/api',
    headers: {
      Authorization: `JWT ${authContext.state.accessToken}`,
    },
  });

  const fetchDates = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await axiosInstance.get(`/trip-dates/${tripId}/`);
      const updatedDates = response.data.reduce((result, item) => {
        result[item.day] = { selected: true, id: item.id };
        return result;
      }, {});
      setSelectedDates(updatedDates);
    } catch (error) {
      setError(true);
      console.error('Error fetching dates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  const onDaySelect = useCallback(
    async (day) => {
      try {
        if (selectedDates[day.dateString]) {
          await axiosInstance.delete(
            `/trip-date/${selectedDates[day.dateString].id}/`,
          );
          const { [day.dateString]: deletedDate, ...updatedDates } =
            selectedDates;
          setSelectedDates(updatedDates);
        } else {
          const response = await axiosInstance.post(`/trip-dates/${tripId}/`, {
            day: day.dateString,
          });
          setSelectedDates((prevDates) => ({
            ...prevDates,
            [day.dateString]: { selected: true, id: response.data.id },
          }));
        }
      } catch (error) {
        const errorMessage = selectedDates[day.dateString]
          ? 'Error deleting date.'
          : 'Error adding date.';
        alert(errorMessage);
        console.error(errorMessage, error);
      }
    },
    [selectedDates, tripId],
  );

  useEffect(() => {
    fetchDates();
  }, []);

  return (
    <Calendar
      key={key}
      onDayPress={onDaySelect}
      firstDay={1}
      markedDates={selectedDates}
      displayLoadingIndicator={isLoading}
      disableMonthChange
      theme={{
        calendarBackground: backgroundStrong,
        textSectionTitleColor: color,
        selectedDayBackgroundColor: blue,
        todayTextColor: blue,
        dayTextColor: color,
        monthTextColor: color,
        arrowColor: blue,
        selectedDayTextColor: backgroundStrong,
      }}
    />
  );
});

export { CustomCalendar };
