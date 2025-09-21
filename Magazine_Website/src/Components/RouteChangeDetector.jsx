import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransition } from '../context/TransitionContext';

const RouteChangeDetector = ({ children })